from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from rest_framework.views import APIView
from .models import Location
from .serializers import LocationSerializer
import math


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

    @action(detail=False, methods=['get'])
    def states(self, request):
        states = Location.objects.values_list('state', flat=True).distinct()
        return Response(list(states))

    @action(detail=False, methods=['get'])
    def districts(self, request):
        state = request.query_params.get('state')
        if not state:
            return Response({"error": "State parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        districts = Location.objects.filter(state=state).values_list('district', flat=True).distinct()
        return Response(list(districts))

    @action(detail=False, methods=['get'])
    def technical_data(self, request):
        district = request.query_params.get('district')
        if not district:
            return Response({"error": "District parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            location = Location.objects.get(district=district)
            serializer = self.get_serializer(location)
            return Response(serializer.data)
        except Location.DoesNotExist:
            return Response({"error": "Location not found"}, status=status.HTTP_404_NOT_FOUND)


class ValidateInputsView(APIView):
    """
    POST /api/validate/
    Validates basic inputs against IRC engineering constraints.
    Returns a dictionary of field errors and warnings.
    """
    def post(self, request):
        data = request.data
        errors = {}
        warnings = {}

        # Span validation (IRC constraints for this module: 20-45m)
        span = data.get('span')
        if span is not None:
            try:
                span = float(span)
                if span < 20 or span > 45:
                    errors['span'] = "Outside the software range. Span must be between 20 m and 45 m."
            except (ValueError, TypeError):
                errors['span'] = "Span must be a valid number."

        # Carriageway width validation
        carriageway_width = data.get('carriageway_width')
        if carriageway_width is not None:
            try:
                carriageway_width = float(carriageway_width)
                if carriageway_width < 4.25 or carriageway_width >= 24:
                    errors['carriageway_width'] = "Width must be ≥4.25 m and <24 m."
            except (ValueError, TypeError):
                errors['carriageway_width'] = "Carriageway width must be a valid number."

        # Skew angle validation (IRC 24:2010)
        skew_angle = data.get('skew_angle')
        if skew_angle is not None:
            try:
                skew_angle = float(skew_angle)
                if abs(skew_angle) > 15:
                    warnings['skew_angle'] = "IRC 24 (2010) requires detailed analysis for skew angles outside ±15°."
            except (ValueError, TypeError):
                errors['skew_angle'] = "Skew angle must be a valid number."

        return Response({
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
        })


class CalculateGeometryView(APIView):
    """
    POST /api/calculate/
    Computes bridge geometry values given the structural constraint:
      (Overall Bridge Width - Deck Overhang) / Girder Spacing = No. of Girders
      Overall Bridge Width = Carriageway Width + 5m

    The 'changed_field' specifies which input was most recently changed.
    Allowed values: 'spacing', 'num_girders', 'overhang'
    The backend derives the other two from the changed field.
    """
    def post(self, request):
        data = request.data
        errors = []

        carriageway_width = data.get('carriageway_width')
        girder_spacing = data.get('girder_spacing')
        num_girders = data.get('num_girders')
        deck_overhang = data.get('deck_overhang')
        changed_field = data.get('changed_field')  # 'spacing' | 'num_girders' | 'overhang'

        # Validate presence
        if carriageway_width is None:
            return Response({"error": "carriageway_width is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            carriageway_width = float(carriageway_width)
            overall_width = carriageway_width + 5.0
        except (ValueError, TypeError):
            return Response({"error": "Invalid carriageway_width."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            girder_spacing = float(girder_spacing) if girder_spacing is not None else 3.0
            num_girders = int(num_girders) if num_girders is not None else 4
            deck_overhang = float(deck_overhang) if deck_overhang is not None else 1.5
        except (ValueError, TypeError):
            return Response({"error": "Invalid geometry parameters."}, status=status.HTTP_400_BAD_REQUEST)

        # Apply auto-calculation based on which field changed
        if changed_field == 'spacing':
            if girder_spacing > 0:
                num_girders = round((overall_width - deck_overhang) / girder_spacing)
        elif changed_field == 'num_girders':
            if num_girders >= 2:
                girder_spacing = round((overall_width - deck_overhang) / num_girders, 1)
        elif changed_field == 'overhang':
            if girder_spacing > 0:
                num_girders = round((overall_width - deck_overhang) / girder_spacing)

        # Constraint validation
        if girder_spacing <= 0:
            errors.append("Girder spacing must be greater than 0.")
        if girder_spacing >= overall_width:
            errors.append("Girder spacing must be less than overall bridge width.")
        if deck_overhang >= overall_width:
            errors.append("Deck overhang must be less than overall bridge width.")
        if num_girders < 2:
            errors.append("Number of girders must be at least 2.")

        # Check constraint satisfaction within tolerance
        if girder_spacing > 0:
            calculated = (overall_width - deck_overhang) / girder_spacing
            if abs(calculated - num_girders) > 0.01:
                errors.append(
                    f"Constraint check: ({overall_width:.1f} - {deck_overhang:.1f}) / "
                    f"{girder_spacing:.1f} = {calculated:.2f}, expected {num_girders} girders."
                )

        return Response({
            "valid": len(errors) == 0,
            "errors": errors,
            "overall_width": overall_width,
            "girder_spacing": girder_spacing,
            "num_girders": num_girders,
            "deck_overhang": deck_overhang,
        })

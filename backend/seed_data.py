import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'osdag_backend.settings')
django.setup()

from bridge_api.models import Location

def seed_data():
    CITY_DATA = [
        { "city": "Mumbai", "state": "Maharashtra", "district": "Mumbai", "windSpeed": 44, "seismicZone": "III", "seismicFactor": 0.16, "maxTemp": 45, "minTemp": 14 },
        { "city": "Delhi", "state": "Delhi", "district": "New Delhi", "windSpeed": 47, "seismicZone": "IV", "seismicFactor": 0.24, "maxTemp": 47, "minTemp": 2 },
        { "city": "Chennai", "state": "Tamil Nadu", "district": "Chennai", "windSpeed": 50, "seismicZone": "III", "seismicFactor": 0.16, "maxTemp": 45, "minTemp": 18 },
        { "city": "Bangalore", "state": "Karnataka", "district": "Bangalore Urban", "windSpeed": 33, "seismicZone": "II", "seismicFactor": 0.10, "maxTemp": 40, "minTemp": 12 },
        { "city": "Kolkata", "state": "West Bengal", "district": "Kolkata", "windSpeed": 50, "seismicZone": "III", "seismicFactor": 0.16, "maxTemp": 43, "minTemp": 8 },
    ]

    for data in CITY_DATA:
        Location.objects.update_or_create(
            district=data['district'],
            state=data['state'],
            defaults={
                'wind_speed': data['windSpeed'],
                'seismic_zone': data['seismicZone'],
                'seismic_factor': data['seismicFactor'],
                'max_temp': data['maxTemp'],
                'min_temp': data['minTemp'],
            }
        )
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_data()

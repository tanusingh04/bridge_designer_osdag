# Osdag - Bridge Designer Pro: Methodology & Challenges Report

## 1. Project Overview
The objective of this project was to refactor the **Osdag** (Open Steel Design and Graphics) web application from a generic boilerplate into a high-fidelity, professional engineering dashboard. The project focused on aligning the user interface with the "Nexus" design system, ensuring real-time visual feedback for bridge parameters, and implementing professional export capabilities.

## 2. Technical Methodology

### 2.1 Design System & Theming
- **Osdag Green Architecture**: Replaced the default color palette with a custom HSL-based "Osdag Green" (`#16A34A`). This theme was applied globally using Tailwind CSS variables to ensure consistency across headers, buttons, and active states.
- **Component Refactoring**: Redesigned the form sections into bordered cards with solid green headers, significantly improving the visual hierarchy and scanning efficiency for engineering professionals.

### 2.2 Reactive Engineering Logic (State Lifting)
- **Centralized Hook System**: To enable real-time updates of the bridge diagrams, the core engineering state (Span, Carriageway Width, Skew Angle, etc.) was lifted from the local form component to the main `Index.tsx` page.
- **Prop Synchronization**: Used React props to sync the input fields with the dynamic SVG drawings and the bottom summary dashboard simultaneously.

### 2.3 Vector Engineering Graphics (SVG)
- **Dynamic SVGs**: Replaced "clumsy" static images with custom-coded React SVG components. These components use mathematical logic to recalculate beam counts, bracing offsets, and abutment skews based on live user input.
- **Theme Reactivity**: The SVGs were engineered to be "theme-aware," automatically adjusting line colors and fills when the user toggles between Light and Dark modes.

### 2.4 Unbranding & Identity
- **Complete Scrubbing**: Performed a full cleanup of the project boilerplate to remove all "Lovable" branding, meta-tags, and the heart icon.
- **Identity Update**: Re-branded the application as **"structura"** and integrated a professional Osdag-specific logo (O+I-beam profile) into the header.

## 3. Key Challenges & Solutions

### 3.1 SVG Geometry Reactivity
- **Challenge**: Mapping real-world meters (e.g., a 12m width) into a constrained SVG viewBox while keeping the drawing centered and proportional.
- **Solution**: Implemented a responsive scaling logic within the SVG components that calculates `spacingPx` based on the available `totalWidth` and `numGirders`, ensuring the drawing never overflows the container.

### 3.2 High-Fidelity Export
- **Challenge**: Capturing raw SVG elements as downloadable PNGs and PDFs without losing quality or failing to render CSS-in-JS styles.
- **Solution**: Integrated `html2canvas` with a high-scale factor (2x) and `jsPDF` using a landscape orientation. This ensures that the technical diagrams remain clear and readable for professional reports.

### 3.3 Backend Math Sync
- **Challenge**: Maintaining the (Overall Width − Overhang) / Spacing = No. of Girders constraint.
- **Solution**: Integrated with local Django API endpoints (`/api/calculate/`) to perform server-side calculations whenever the "Additional Inputs" are modified, ensuring engineering accuracy.

## 4. Conclusion
The resulting "structura" platform is a massive upgrade from the original state. It provides a seamless transition from input to visualization, allowing engineers to see the physical implications of their data in real-time while providing professional-grade export tools for their final designs.

🌿 Fasal-Drishti

Smart Vision for Healthy Farms | AI-Powered Precision Agriculture

📌 Overview

Fasal-Drishti is a modern, responsive web application designed to bring precision agriculture to farmers. By leveraging satellite imagery and NDVI (Normalized Difference Vegetation Index) data, the platform allows users to map their fields, evaluate crop health in real-time, and calculate precision ROI to save on resources like targeted spraying.

Built with a "Mobile-First" approach, the app scales beautifully across all devices, pairing an artisanal brand aesthetic with cutting-edge data visualization.

🚀 Key Features

Interactive Field Mapping: Draw and define exact field boundaries using our interactive map interface.

Live Telemetry & NDVI Analysis: Integrates with the AgroMonitoring API to fetch real satellite data to determine crop health distribution (Healthy, Watch, High Risk, Critical).

Precision ROI Calculator: Uses CDF distribution math to calculate exactly how much resource (e.g., spray) a farmer can save by targeting specific zones rather than the whole field.

Deterministic Zero-Latency Fallback: Ensures a flawless user experience. If the satellite processing engine delays (or if API keys are missing), the app instantly calculates a realistic, deterministic live score based on geographic coordinates, ensuring zero downtime during critical deployments.

Global Data Synchronization: Powered by React Context, ensuring the dashboard and the map always reflect the exact same live state.

Fully Responsive Design: A bespoke UI built with Tailwind CSS, featuring artisanal typography (Fraunces & Inter) that adapts flawlessly from mobile screens to desktop split-view monitors.

🛠 Tech Stack

Frontend Framework: React.js (via Vite)

Styling: Tailwind CSS (Mobile-First Architecture)

State Management: React Context API

Routing: React Router / Component State Routing

External APIs: AgroMonitoring API (Optional for local testing)

Deployment: Vercel

💻 Getting Started (Local Development)

We built Fasal-Drishti to be incredibly easy to review. Out of the box, it runs in a Zero-Config Demo Mode utilizing our deterministic math fallback, meaning you do not need to configure any external API keys to test the core features.

1. Clone the repository:

git clone [https://github.com/aayumay/Fasal-Drishti.git](https://github.com/aayumay/Fasal-Drishti.git)
cd Fasal-Drishti


2. Install dependencies:

npm install


3. Start the development server:

npm run dev


(Note: To connect to the live AgroMonitoring production servers instead of the demo fallback, simply add a valid VITE_AGRO_API_KEY to your local .env file).

🔗 Live Demo

Check out the live application here: https://fasal-drishti-zeta.vercel.app

Built with ❤️ for the Hackathon.

#!/bin/bash

# Configuration
SERVICE_NAME="event-service"
PROJECT_ID="eventify-460809"
REGION="asia-southeast1"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
IMAGE_TAG="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:${TIMESTAMP}"

echo "Starting deployment process for ${SERVICE_NAME}..."

# Check if .env.prod exists
if [ ! -f ".env.prod" ]; then
    echo "Error: .env.prod file not found!"
    echo "Please create .env.prod file with your environment variables."
    echo "You can use env.template as a reference."
    exit 1
fi

# Generate service.yaml with environment variables
echo "Generating service.yaml..."
chmod +x generate-service-yaml.sh
./generate-service-yaml.sh

if [ ! -f "service.yaml" ]; then
    echo "Error: Failed to generate service.yaml"
    exit 1
fi

# Build Docker image for Linux platform (required for Cloud Run)
echo "Building Docker image for Linux platform..."
docker build --platform linux/amd64 -t "${IMAGE_TAG}" -t "gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest" .

if [ $? -ne 0 ]; then
    echo "Error: Docker build failed"
    exit 1
fi

# Push image to Google Container Registry
echo "Pushing image to Google Container Registry..."
docker push "${IMAGE_TAG}"
docker push "gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

if [ $? -ne 0 ]; then
    echo "Error: Docker push failed"
    exit 1
fi

# Update service.yaml with the specific image tag
sed -i.bak "s|gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest|${IMAGE_TAG}|g" service.yaml

# Deploy to Cloud Run using the service.yaml
echo "Deploying to Cloud Run..."
gcloud run services replace service.yaml \
    --region="${REGION}" \
    --project="${PROJECT_ID}"

if [ $? -ne 0 ]; then
    echo "Error: Cloud Run deployment failed"
    exit 1
fi

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
    --region="${REGION}" \
    --project="${PROJECT_ID}" \
    --format="value(status.url)")

echo "Deployment completed successfully!"
echo "Service URL: ${SERVICE_URL}"
echo "Deployed image: ${IMAGE_TAG}"
echo ""
echo "API Documentation: ${SERVICE_URL}/API"
echo "Health check: ${SERVICE_URL}/event"

# Clean up
rm -f service.yaml.bak 
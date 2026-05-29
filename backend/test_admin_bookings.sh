#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_GATEWAY="http://localhost:8080"
BOOKING_SERVICE="http://localhost:8082"

# Test 1: Get all bookings via API Gateway
echo -e "${YELLOW}Test 1: Fetching all bookings via API Gateway GraphQL endpoint${NC}"
curl -X POST "$API_GATEWAY/api/bookings/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIifQ.2c0d3d7d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d" \
  -d '{
    "query": "query { allBookings(page: 0, size: 50) { id userId houseId startDate endDate status totalPrice createdAt updatedAt } }"
  }' 2>/dev/null | jq .

# Test 2: Get all bookings directly from booking-service
echo -e "\n${YELLOW}Test 2: Fetching all bookings directly from booking-service${NC}"
curl -X POST "$BOOKING_SERVICE/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIifQ.2c0d3d7d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d" \
  -d '{
    "query": "query { allBookings { id userId houseId startDate endDate status totalPrice } }"
  }' 2>/dev/null | jq .

echo -e "\n${GREEN}Tests completed!${NC}"

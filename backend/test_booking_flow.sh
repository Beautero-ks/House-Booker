echo "=========================================="

# Create a GraphQL mutation to create a booking
BOOKING_MUTATION='
mutation {
  createBooking(userId: "550e8400-e29b-41d4-a716-446655440001", input: {
    houseId: "660e8400-e29b-41d4-a716-446655440001",
    startDate: "2026-06-20",
    endDate: "2026-06-25"
  }) {
    id
    userId
    houseId
    startDate
    endDate
    totalPrice
    status
  }
}
'

echo -e "\n1. Creating a booking via GraphQL mutation..."
RESPONSE=$(curl -s -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$(echo $BOOKING_MUTATION | tr '\n' ' ')\"}")

echo "Response: $RESPONSE"

# Extract booking ID from response
BOOKING_ID=$(echo $RESPONSE | grep -oP '"id":"?\K[^",]+')
echo "Booking ID: $BOOKING_ID"

# Wait for events to be processed
echo -e "\n2. Waiting for Kafka events to be processed (10 seconds)..."
sleep 10

echo -e "\n3. Checking if booking was created in Kafka topic..."
docker exec kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic bookings.created --from-beginning --max-messages 1 --timeout-ms 5000 2>/dev/null || echo "No messages in bookings.created topic yet"

echo -e "\n4. Checking if notification was created..."
docker exec kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic notifications.email --from-beginning --max-messages 1 --timeout-ms 5000 2>/dev/null || echo "No messages in notifications.email topic yet"

echo -e "\n=========================================="
echo "Test Complete"
echo "=========================================="


#!/bin/bash

set -e

TEST_TYPE=${1:-all}
ENVIRONMENT=${2:-staging}

echo "🔥 Running load tests..."
echo "Type: $TEST_TYPE"
echo "Environment: $ENVIRONMENT"
echo ""

# Set target URL
if [ "$ENVIRONMENT" == "staging" ]; then
  export TEST_URL="https://staging.glowverse.app"
elif [ "$ENVIRONMENT" == "production" ]; then
  export TEST_URL="https://api.glowverse.com"
else
  export TEST_URL="http://localhost:3000"
fi

echo "Target: $TEST_URL"
echo ""

# Ensure results directory exists
mkdir -p load-tests/results

# Run tests based on type
case $TEST_TYPE in
  "load")
    echo "📊 Running load test..."
    npx artillery run load-tests/scenarios.yml \
      --output load-tests/results/load-test-$(date +%Y%m%d-%H%M%S).json
    ;;
  
  "stress")
    echo "💪 Running stress test..."
    npx artillery run load-tests/stress-test.yml \
      --output load-tests/results/stress-test-$(date +%Y%m%d-%H%M%S).json
    ;;
  
  "endurance")
    echo "⏱️  Running endurance test (2 hours)..."
    npx artillery run load-tests/endurance-test.yml \
      --output load-tests/results/endurance-test-$(date +%Y%m%d-%H%M%S).json
    ;;
  
  "performance")
    echo "🚀 Running performance tests..."
    node load-tests/performance-tests.js
    ;;
  
  "all")
    echo "🎯 Running all tests..."
    
    echo "\n1️⃣  Performance tests..."
    node load-tests/performance-tests.js
    
    echo "\n2️⃣  Load test..."
    npx artillery run load-tests/scenarios.yml \
      --output load-tests/results/load-test-$(date +%Y%m%d-%H%M%S).json
    
    echo "\n3️⃣  Stress test..."
    npx artillery run load-tests/stress-test.yml \
      --output load-tests/results/stress-test-$(date +%Y%m%d-%H%M%S).json
    ;;
  
  *)
    echo "Unknown test type: $TEST_TYPE"
    echo "Valid types: load, stress, endurance, performance, all"
    exit 1
    ;;
esac

echo ""
echo "✅ Load tests completed!"
echo "Results saved to load-tests/results/"

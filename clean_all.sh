#!/bin/bash

# Clean All Script
# Complete cleanup of Docker containers, images, and codebase
# Use this to reset everything to a clean state

set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Complete Cleanup Script${NC}"
echo -e "${YELLOW}=========================${NC}"
echo ""
echo -e "${YELLOW}This script will:${NC}"
echo -e "  🐳 Stop and remove all Docker containers"
echo -e "  🗑️  Remove Docker images (optional)"
echo -e "  📦 Clean pnpm cache and node_modules"
echo -e "  🔨 Remove TypeScript build artifacts"
echo -e "  🌊 Kill any running streams or servers"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to kill processes on specific ports
kill_port_processes() {
    local port=$1
    local process_name=$2
    
    echo -e "${CYAN}🔍 Checking for processes on port $port ($process_name)...${NC}"
    
    # Find processes using the port
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}Found processes on port $port: $pids${NC}"
        echo -e "${YELLOW}Killing processes...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}✅ Killed processes on port $port${NC}"
    else
        echo -e "${GREEN}✅ No processes running on port $port${NC}"
    fi
}

# ============================================================================
# 1. Kill running processes
# ============================================================================

echo -e "${BLUE}🛑 Step 1: Stopping running processes${NC}"
echo ""

# Kill processes on common ports
kill_port_processes 3000 "Fastify server"
kill_port_processes 8080 "Skip streaming"
kill_port_processes 8081 "Skip control"

# Kill any node processes that might be running our app
echo -e "${CYAN}🔍 Checking for Node.js processes...${NC}"
node_pids=$(pgrep -f "node.*dist/index.js" 2>/dev/null || true)
if [ -n "$node_pids" ]; then
    echo -e "${YELLOW}Found Node.js app processes: $node_pids${NC}"
    echo "$node_pids" | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ Killed Node.js app processes${NC}"
else
    echo -e "${GREEN}✅ No Node.js app processes found${NC}"
fi

echo ""

# ============================================================================
# 2. Docker cleanup
# ============================================================================

echo -e "${BLUE}🐳 Step 2: Docker cleanup${NC}"
echo ""

if ! command_exists docker; then
    echo -e "${YELLOW}⚠️  Docker not found, skipping Docker cleanup${NC}"
else
    # Stop and remove specific container
    echo -e "${CYAN}🛑 Stopping skip-demo-postgres container...${NC}"
    if docker ps -q -f name=skip-demo-postgres | grep -q .; then
        docker stop skip-demo-postgres
        echo -e "${GREEN}✅ Stopped skip-demo-postgres container${NC}"
    else
        echo -e "${GREEN}✅ skip-demo-postgres container not running${NC}"
    fi

    echo -e "${CYAN}🗑️  Removing skip-demo-postgres container...${NC}"
    if docker ps -a -q -f name=skip-demo-postgres | grep -q .; then
        docker rm skip-demo-postgres
        echo -e "${GREEN}✅ Removed skip-demo-postgres container${NC}"
    else
        echo -e "${GREEN}✅ skip-demo-postgres container not found${NC}"
    fi

    # Optional: Remove all stopped containers
    echo ""
    echo -e "${YELLOW}Do you want to remove ALL stopped Docker containers? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${CYAN}🗑️  Removing all stopped containers...${NC}"
        stopped_containers=$(docker ps -a -q --filter "status=exited" 2>/dev/null || true)
        if [ -n "$stopped_containers" ]; then
            docker rm $stopped_containers
            echo -e "${GREEN}✅ Removed all stopped containers${NC}"
        else
            echo -e "${GREEN}✅ No stopped containers to remove${NC}"
        fi
    fi

    # Optional: Remove unused images
    echo ""
    echo -e "${YELLOW}Do you want to remove unused Docker images? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${CYAN}🗑️  Removing unused Docker images...${NC}"
        docker image prune -f
        echo -e "${GREEN}✅ Removed unused Docker images${NC}"
    fi

    # Optional: Remove volumes
    echo ""
    echo -e "${YELLOW}Do you want to remove unused Docker volumes? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${CYAN}🗑️  Removing unused Docker volumes...${NC}"
        docker volume prune -f
        echo -e "${GREEN}✅ Removed unused Docker volumes${NC}"
    fi
fi

echo ""

# ============================================================================
# 3. pnpm and Node.js cleanup
# ============================================================================

echo -e "${BLUE}📦 Step 3: pnpm and Node.js cleanup${NC}"
echo ""

if ! command_exists pnpm; then
    echo -e "${YELLOW}⚠️  pnpm not found, skipping pnpm cleanup${NC}"
    
    # Fallback to npm if available
    if command_exists npm; then
        echo -e "${CYAN}🗑️  Using npm to clean node_modules...${NC}"
        rm -rf node_modules
        echo -e "${GREEN}✅ Removed node_modules${NC}"
    fi
else
    # pnpm clean (removes dist and node_modules)
    echo -e "${CYAN}🧹 Running pnpm clean...${NC}"
    pnpm clean
    echo -e "${GREEN}✅ pnpm clean completed${NC}"

    # Clean pnpm store
    echo ""
    echo -e "${YELLOW}Do you want to clean the pnpm store? (removes cached packages) (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${CYAN}🗑️  Cleaning pnpm store...${NC}"
        pnpm store prune
        echo -e "${GREEN}✅ pnpm store cleaned${NC}"
    fi
fi

# ============================================================================
# 4. Additional cleanup
# ============================================================================

echo ""
echo -e "${BLUE}🔨 Step 4: Additional cleanup${NC}"
echo ""

# Remove TypeScript build artifacts (in case pnpm clean didn't work)
echo -e "${CYAN}🗑️  Removing TypeScript build artifacts...${NC}"
rm -rf dist/
rm -rf build/
rm -rf .tsbuildinfo
echo -e "${GREEN}✅ Removed TypeScript build artifacts${NC}"

# Remove logs
echo -e "${CYAN}🗑️  Removing log files...${NC}"
rm -rf logs/
rm -f *.log
rm -f npm-debug.log*
rm -f yarn-debug.log*
rm -f yarn-error.log*
echo -e "${GREEN}✅ Removed log files${NC}"

# Remove OS-specific files
echo -e "${CYAN}🗑️  Removing OS-specific files...${NC}"
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true
echo -e "${GREEN}✅ Removed OS-specific files${NC}"

# ============================================================================
# 5. Verification
# ============================================================================

echo ""
echo -e "${BLUE}✅ Step 5: Verification${NC}"
echo ""

echo -e "${CYAN}🔍 Checking current state...${NC}"

# Check Docker containers
if command_exists docker; then
    running_containers=$(docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null | grep -v "NAMES" || true)
    if [ -n "$running_containers" ]; then
        echo -e "${YELLOW}Running Docker containers:${NC}"
        echo "$running_containers"
    else
        echo -e "${GREEN}✅ No Docker containers running${NC}"
    fi
else
    echo -e "${GREEN}✅ Docker not available${NC}"
fi

# Check for remaining artifacts
echo -e "${CYAN}🔍 Checking for remaining artifacts...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules still exists${NC}"
else
    echo -e "${GREEN}✅ node_modules removed${NC}"
fi

if [ -d "dist" ]; then
    echo -e "${YELLOW}⚠️  dist directory still exists${NC}"
else
    echo -e "${GREEN}✅ dist directory removed${NC}"
fi

# Check ports
echo -e "${CYAN}🔍 Checking if ports are free...${NC}"
for port in 3000 8080 8081 5432; do
    if lsof -ti :$port >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port is still in use${NC}"
    else
        echo -e "${GREEN}✅ Port $port is free${NC}"
    fi
done

# ============================================================================
# 6. Summary
# ============================================================================

echo ""
echo -e "${GREEN}🎉 Cleanup completed!${NC}"
echo ""
echo -e "${CYAN}========== Summary ==========${NC}"
echo -e "${GREEN}✅ Stopped all running processes${NC}"
echo -e "${GREEN}✅ Cleaned Docker containers${NC}"
echo -e "${GREEN}✅ Cleaned pnpm/npm artifacts${NC}"
echo -e "${GREEN}✅ Removed build artifacts${NC}"
echo -e "${GREEN}✅ Cleaned temporary files${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "  1. Run: ${PURPLE}./init_server.sh${NC} to reinitialize"
echo -e "  2. Or manually: ${PURPLE}pnpm install && pnpm build && pnpm start${NC}"
echo ""
echo -e "${GREEN}Ready for a fresh start! 🚀${NC}"
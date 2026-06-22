#!/bin/bash
# Get the directory where the .command file is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Run the start script
cd "$DIR"
chmod +x start.sh
./start.sh

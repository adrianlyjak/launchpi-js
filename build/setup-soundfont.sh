#!/bin/bash
set -e

# Idempotent script to install fluidsynth and download the soundfont
# Can be re-run safely
# Note: FluidSynth is now managed as a child process by launchpi, not as a systemd service

# Install required system dependencies
echo "Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y build-essential libasound2-dev fluidsynth wget unzip

SOUNDFONT_PATH="/usr/share/sounds/sf2/GeneralUser_GS_v1.471.sf2"

# Download and install soundfont if not present
if [ ! -f "$SOUNDFONT_PATH" ]; then
    echo "Soundfont not found at $SOUNDFONT_PATH, downloading..."

    TEMP_DIR=$(mktemp -d)
    trap "rm -rf $TEMP_DIR" EXIT

    cd "$TEMP_DIR"

    # Download from Dropbox (dl=1 makes it a direct download)
    wget -O GeneralUser_GS_1.471.zip 'https://www.dropbox.com/s/4x27l49kxcwamp5/GeneralUser_GS_1.471.zip?dl=1'

    # Extract
    unzip GeneralUser_GS_1.471.zip

    # Ensure target directory exists
    sudo mkdir -p /usr/share/sounds/sf2

    # Install the soundfont
    sudo mv "GeneralUser GS 1.471/GeneralUser GS v1.471.sf2" "$SOUNDFONT_PATH"

    echo "Soundfont installed to $SOUNDFONT_PATH"

    cd - > /dev/null
else
    echo "Soundfont already installed at $SOUNDFONT_PATH"
fi

echo ""
echo "Setup complete!"
echo "FluidSynth and soundfont are installed."
echo "Note: FluidSynth is managed by launchpi as a child process, not as a separate service."

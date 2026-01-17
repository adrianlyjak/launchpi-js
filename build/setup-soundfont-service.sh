#!/bin/bash
set -e

# Idempotent script to set up the fluidsynth systemd service for soundfont
# Can be re-run safely to update the service

# Install required system dependencies
echo "Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y build-essential libasound2-dev fluidsynth wget unzip

SERVICE_NAME="fluidsynth-launchpi"
SERVICE_DIR="$HOME/.config/systemd/user"
SERVICE_FILE="${SERVICE_DIR}/${SERVICE_NAME}.service"
SOUNDFONT_PATH="/usr/share/sounds/sf2/GeneralUser_GS_v1.471.sf2"

# Ensure user systemd directory exists
mkdir -p "$SERVICE_DIR"

echo "Setting up ${SERVICE_NAME} user systemd service..."

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

# Create/update the systemd user service file
cat > "$SERVICE_FILE" <<'EOF'
[Unit]
Description=FluidSynth service for launchpi MIDI output
After=pipewire.service pipewire-pulse.service
Wants=pipewire-pulse.service

[Service]
Type=simple
ExecStart=/usr/bin/fluidsynth -a pulseaudio -m alsa_seq /usr/share/sounds/sf2/GeneralUser_GS_v1.471.sf2 -o shell.port=9800 --server -i -p fluid
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=default.target
EOF

echo "Service file written to $SERVICE_FILE"

# Reload user systemd to pick up changes
systemctl --user daemon-reload
echo "User systemd daemon reloaded"

# Enable the service to start on login
systemctl --user enable "${SERVICE_NAME}.service"
echo "Service enabled"

# Enable lingering so user services start at boot (not just login)
sudo loginctl enable-linger "$USER"
echo "Lingering enabled for $USER"

# Restart the service to apply any changes
systemctl --user restart "${SERVICE_NAME}.service"
echo "Service restarted"

# Show status
echo ""
echo "Service status:"
systemctl --user status "${SERVICE_NAME}.service" --no-pager || true

echo ""
echo "Setup complete!"

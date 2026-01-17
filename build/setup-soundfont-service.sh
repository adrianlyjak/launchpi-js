#!/bin/bash
set -e

# Idempotent script to set up the fluidsynth systemd service for soundfont
# Can be re-run safely to update the service

SERVICE_NAME="fluidsynth"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
SOUNDFONT_PATH="/usr/share/sounds/sf2/GeneralUser_GS_v1.471.sf2"

echo "Setting up ${SERVICE_NAME} systemd service..."

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

# Create/update the systemd service file
sudo tee "$SERVICE_FILE" > /dev/null <<'EOF'
[Unit]
Description=fluidsynth service for output from launchpi

[Service]
Type=simple
ExecStart=fluidsynth -a alsa -m alsa_seq /usr/share/sounds/sf2/GeneralUser_GS_v1.471.sf2 -o shell.port=9800 --server -i -p fluid
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

echo "Service file written to $SERVICE_FILE"

# Reload systemd to pick up changes
sudo systemctl daemon-reload
echo "Systemd daemon reloaded"

# Enable the service to start on boot
sudo systemctl enable "${SERVICE_NAME}.service"
echo "Service enabled"

# Restart the service to apply any changes
sudo systemctl restart "${SERVICE_NAME}.service"
echo "Service restarted"

# Show status
echo ""
echo "Service status:"
sudo systemctl status "${SERVICE_NAME}.service" --no-pager || true

echo ""
echo "Setup complete!"

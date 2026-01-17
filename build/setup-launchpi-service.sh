#!/bin/bash
set -e

# Idempotent script to set up launchpi-js as a systemd user service
# Can be re-run safely to update the service

SERVICE_NAME="launchpi"
SERVICE_DIR="$HOME/.config/systemd/user"
SERVICE_FILE="${SERVICE_DIR}/${SERVICE_NAME}.service"

# Get the directory where this script is located, then go up one level for project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Setting up ${SERVICE_NAME} user systemd service..."
echo "Project directory: $PROJECT_DIR"

# Ensure the project is built
if [ ! -f "$PROJECT_DIR/dist/midi.js" ]; then
    echo "Building project..."
    cd "$PROJECT_DIR"
    pnpm run build
fi

# Ensure user systemd directory exists
mkdir -p "$SERVICE_DIR"

# Detect node path
NODE_PATH=$(which node)
echo "Using node at: $NODE_PATH"

# Create/update the systemd user service file
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=Launchpi MIDI controller service
After=fluidsynth-launchpi.service
Wants=fluidsynth-launchpi.service

[Service]
Type=simple
WorkingDirectory=${PROJECT_DIR}
Environment=NODE_ENV=production
ExecStart=${NODE_PATH} ${PROJECT_DIR}/dist/midi.js
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
echo ""
echo "Useful commands:"
echo "  systemctl --user status launchpi    # Check status"
echo "  systemctl --user restart launchpi   # Restart service"
echo "  systemctl --user stop launchpi      # Stop service"
echo "  journalctl --user -u launchpi -f    # View logs"

#!/bin/bash
rsync -av --partial --exclude node_modules --exclude .git ../midi launchpi@launchpi:

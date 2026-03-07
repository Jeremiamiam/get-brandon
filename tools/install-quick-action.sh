#!/bin/bash
# GET BRANDON — Install Finder Quick Action "Open GBD Here"
#
# This script creates an Automator Quick Action (Service) that opens a Terminal
# window with the current Finder folder selected, ready for Claude Code / GBD.
#
# After running this script:
# 1. Right-click any folder in Finder
# 2. Select "Quick Actions" > "Open GBD Here"
# 3. Terminal opens, cd'd into that folder
#
# To assign a keyboard shortcut:
# System Settings > Keyboard > Keyboard Shortcuts > Services > Files and Folders
# Find "Open GBD Here" and assign a shortcut (e.g. ⌃⌥⌘G)

set -e

WORKFLOW_NAME="Open GBD Here"
SERVICES_DIR="$HOME/Library/Services"
WORKFLOW_DIR="$SERVICES_DIR/${WORKFLOW_NAME}.workflow"
CONTENTS_DIR="$WORKFLOW_DIR/Contents"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " GET BRANDON — Quick Action Installer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remove existing if present
if [ -d "$WORKFLOW_DIR" ]; then
  rm -rf "$WORKFLOW_DIR"
  echo "! Ancienne version supprimée"
fi

mkdir -p "$CONTENTS_DIR"

# Create document.wflow (Automator workflow XML)
cat > "$CONTENTS_DIR/document.wflow" << 'WFLOW_EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>AMApplicationBuild</key>
	<string>521.1</string>
	<key>AMApplicationVersion</key>
	<string>2.10</string>
	<key>AMDocumentVersion</key>
	<string>2</string>
	<key>actions</key>
	<array>
		<dict>
			<key>action</key>
			<dict>
				<key>AMAccepts</key>
				<dict>
					<key>Container</key>
					<string>List</string>
					<key>Optional</key>
					<true/>
					<key>Types</key>
					<array>
						<string>com.apple.cocoa.path</string>
					</array>
				</dict>
				<key>AMActionVersion</key>
				<string>1.0.2</string>
				<key>AMApplication</key>
				<array>
					<string>Automator</string>
				</array>
				<key>AMParameterProperties</key>
				<dict>
					<key>COMMAND_STRING</key>
					<dict/>
					<key>CheckedForUserDefaultShell</key>
					<dict/>
					<key>inputMethod</key>
					<dict/>
					<key>shell</key>
					<dict/>
					<key>source</key>
					<dict/>
				</dict>
				<key>AMProvides</key>
				<dict>
					<key>Container</key>
					<string>List</string>
					<key>Types</key>
					<array>
						<string>com.apple.cocoa.path</string>
					</array>
				</dict>
				<key>ActionBundlePath</key>
				<string>/System/Library/Automator/Run Shell Script.action</string>
				<key>ActionName</key>
				<string>Run Shell Script</string>
				<key>ActionParameters</key>
				<dict>
					<key>COMMAND_STRING</key>
					<string>for f in "$@"; do
  if [ -d "$f" ]; then
    TARGET="$f"
  else
    TARGET="$(dirname "$f")"
  fi
  osascript -e "tell application \"Terminal\"
    activate
    do script \"cd \" &amp; quoted form of \"$TARGET\" &amp; \" &amp;&amp; claude\"
  end tell"
done</string>
					<key>CheckedForUserDefaultShell</key>
					<true/>
					<key>inputMethod</key>
					<integer>1</integer>
					<key>shell</key>
					<string>/bin/bash</string>
					<key>source</key>
					<string></string>
				</dict>
				<key>BundleIdentifier</key>
				<string>com.apple.RunShellScript</string>
				<key>CFBundleVersion</key>
				<string>1.0.2</string>
				<key>CanShowSelectedItemsWhenRun</key>
				<false/>
				<key>CanShowWhenRun</key>
				<true/>
				<key>Category</key>
				<array>
					<string>AMCategoryUtilities</string>
				</array>
				<key>Class Name</key>
				<string>RunShellScriptAction</string>
				<key>InputUUID</key>
				<string>6B41EE5C-1B23-4B9F-9B7D-2C1E3F4A5B6D</string>
				<key>Keywords</key>
				<array>
					<string>Shell</string>
					<string>Script</string>
					<string>Command</string>
					<string>Run</string>
					<string>Unix</string>
				</array>
				<key>OutputUUID</key>
				<string>7C52FF6D-2C34-5CAG-AC8E-3D2F4G5B6C7E</string>
				<key>UUID</key>
				<string>5A30DD4B-0A12-3A8E-8A6C-1B0E2D3C4B5A</string>
				<key>UnlocalizedApplications</key>
				<array>
					<string>Automator</string>
				</array>
				<key>arguments</key>
				<dict/>
				<key>isViewVisible</key>
				<true/>
				<key>location</key>
				<string>309.5:253.0</string>
				<key>nibPath</key>
				<string>/System/Library/Automator/Run Shell Script.action/Contents/Resources/English.lproj/main.nib</string>
			</dict>
			<key>isViewVisible</key>
			<true/>
		</dict>
	</array>
	<key>connectors</key>
	<dict/>
	<key>workflowMetaData</key>
	<dict>
		<key>applicationBundleIDsByPath</key>
		<dict/>
		<key>applicationPaths</key>
		<array/>
		<key>inputTypeIdentifier</key>
		<string>com.apple.Automator.fileSystemObject.folder</string>
		<key>outputTypeIdentifier</key>
		<string>com.apple.Automator.nothing</string>
		<key>presentationMode</key>
		<integer>11</integer>
		<key>processesInput</key>
		<integer>0</integer>
		<key>serviceApplicationBundleID</key>
		<string>com.apple.finder</string>
		<key>serviceApplicationPath</key>
		<string>/System/Library/CoreServices/Finder.app</string>
		<key>serviceInputTypeIdentifier</key>
		<string>com.apple.Automator.fileSystemObject.folder</string>
		<key>serviceOutputTypeIdentifier</key>
		<string>com.apple.Automator.nothing</string>
		<key>serviceProcessesInput</key>
		<integer>0</integer>
		<key>systemImageName</key>
		<string>NSActionTemplate</string>
		<key>useAutomaticInputType</key>
		<false/>
		<key>workflowTypeIdentifier</key>
		<string>com.apple.Automator.servicesMenu</string>
	</dict>
</dict>
</plist>
WFLOW_EOF

# Create Info.plist
cat > "$CONTENTS_DIR/Info.plist" << 'INFO_EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>NSServices</key>
	<array>
		<dict>
			<key>NSMenuItem</key>
			<dict>
				<key>default</key>
				<string>Open GBD Here</string>
			</dict>
			<key>NSMessage</key>
			<string>runWorkflowAsService</string>
			<key>NSRequiredContext</key>
			<dict>
				<key>NSApplicationIdentifier</key>
				<string>com.apple.finder</string>
			</dict>
			<key>NSSendFileTypes</key>
			<array>
				<string>public.folder</string>
			</array>
		</dict>
	</array>
</dict>
</plist>
INFO_EOF

echo "✓ Quick Action installée : $WORKFLOW_DIR"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Prochaines étapes :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Recharger les services :"
echo "   /System/Library/CoreServices/pbs -update"
echo ""
echo "2. Tester : clic droit sur un dossier dans Finder"
echo "   > Services > Open GBD Here"
echo ""
echo "3. Optionnel — assigner un raccourci clavier :"
echo "   Réglages Système > Clavier > Raccourcis clavier"
echo "   > Services > Fichiers et dossiers > Open GBD Here"
echo "   Suggéré : ⌃⌥⌘G"
echo ""

# Auto-reload services
if /System/Library/CoreServices/pbs -update 2>/dev/null; then
  echo "✓ Services rechargés automatiquement"
fi

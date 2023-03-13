npm install
mkdir ~/.homebridge/
cp ./.devcontainer/config/hb.config.json ~/.homebridge/config.json
cp ./.devcontainer/config/auth.json ~/.homebridge/auth.json
npm install -g ./
npm run watch
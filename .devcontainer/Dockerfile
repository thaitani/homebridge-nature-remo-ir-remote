ARG VARIANT="18"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

RUN su node -c "npm install -g npm"
RUN su node -c "npm install -g --unsafe-perm homebridge homebridge-config-ui-x"

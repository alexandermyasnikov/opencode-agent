FROM ubuntu:26.04

RUN apt-get update && apt-get install --yes --no-install-recommends \
    ca-certificates \
    curl \
    jq \
    git \
    dnsutils \
    ncat \
    gdb \
    build-essential \
    openssh-client \
    python3 \
    python3-pip \
    python3-venv \
    fd-find \
    ripgrep \
    docker.io \
    golang-go \
 && rm -rf /var/lib/apt/lists/*

ENV GOTOOLCHAIN=local
ENV PATH="/root/go/bin:${PATH}"
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go install golang.org/x/tools/gopls@latest \
 && go install github.com/go-task/task/v3/cmd/task@v3.52.0

RUN curl -fsSL https://opencode.ai/v2/install | bash
RUN curl -fsSL https://astral.sh/uv/install.sh | sh

ENV PATH="/root/.local/bin:${PATH}"
RUN uv tool install git+https://github.com/oraios/serena \
 && uv tool install mcp-sequential-thinking

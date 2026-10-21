FROM ubuntu:26.10

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
	--mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
	rm -f /etc/apt/apt.conf.d/docker-clean \
	&& apt-get update \
	&& apt-get install --yes --no-install-recommends \
		build-essential \
		ca-certificates \
		curl \
		dnsutils \
		docker.io \
		fd-find \
		gdb \
		git \
		golang \
		jq \
		libarchive-tools \
		ncat \
		nodejs \
		npm \
		openssh-client \
		python3 \
		python3-pip \
		python3-venv \
		ripgrep \
		tzdata \
		unzip

COPY ./.data/cert/* /usr/local/share/ca-certificates/
RUN update-ca-certificates

ENV PATH="/root/go/bin:/root/.local/bin:${PATH}"

RUN ln -s /usr/bin/bsdtar /usr/bin/tar -f   # fix tar: Cannot open: Function not implemented

RUN curl -fsSL https://opencode.ai/v2/install | bash

RUN --mount=type=cache,target=/root/go/pkg/mod \
	--mount=type=cache,target=/root/.cache/go-build \
	go install golang.org/x/tools/gopls@latest \
	&& go install github.com/go-task/task/v3/cmd/task@latest \
	&& go install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@latest

RUN curl -fsSL https://bun.com/install | bash

RUN --mount=type=cache,target=/root/.cache/uv \
	curl -fsSL https://astral.sh/uv/install.sh | sh \
	&& uv tool install git+https://github.com/oraios/serena

RUN --mount=type=cache,target=/root/.npm \
	npm install -g ssh-mcp \
	&& mkdir -p /root/.config/ssh-mcp \
	&& chmod 700 /root/.config/ssh-mcp

RUN curl -fsSL "https://github.com/github/github-mcp-server/releases/download/v2.0.2/github-mcp-server_Linux_$(dpkg --print-architecture | sed s/amd64/x86_64/).tar.gz" \
	| tar -xz -C /root/.local/bin github-mcp-server
RUN curl -fsSL https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.sh \
	| bash -s -- --skip-config --dir=/usr/local/bin

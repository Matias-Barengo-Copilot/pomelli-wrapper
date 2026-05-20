FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV DISPLAY=:1
ENV WIDTH=1280
ENV HEIGHT=800

RUN apt-get update && apt-get install -y \
    software-properties-common \
    xvfb \
    x11vnc \
    xdotool \
    scrot \
    imagemagick \
    curl \
    wget \
    bash \
    procps \
    socat \
    && add-apt-repository ppa:mozillateam/ppa \
    && printf 'Package: firefox*\nPin: release o=LP-PPA-mozillateam\nPin-Priority: 501\n' > /etc/apt/preferences.d/mozillateam \
    && apt-get update \
    && apt-get install -y firefox \
    && rm -rf /var/lib/apt/lists/*

# Firefox profile directory — will be a Docker volume mount
RUN mkdir -p /firefox-profile /tmp/pomelli

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 5900

CMD ["/start.sh"]

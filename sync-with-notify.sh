#!/bin/bash

cd /home/hellmas/projetos/projetos-2027/playlist-semanal

# Roda o sync e captura o resultado
if /usr/bin/npm run sync >> /tmp/playlist-sync.log 2>&1; then
    MESSAGE="✓ Playlist sincronizada com sucesso! $(date '+%d/%m/%Y %H:%M')"
    URGENCY="normal"
else
    MESSAGE="✗ Erro ao sincronizar playlist! Verifique /tmp/playlist-sync.log"
    URGENCY="critical"
fi

# Envia para todos os terminais (pts) do usuário
for tty in /dev/pts/*; do
    if [ -w "$tty" ] 2>/dev/null; then
        echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n$MESSAGE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" > "$tty" 2>/dev/null || true
    fi
done

# Envia notificação desktop
export WAYLAND_DISPLAY=${WAYLAND_DISPLAY:-wayland-1}
export XDG_RUNTIME_DIR=${XDG_RUNTIME_DIR:-/run/user/$(id -u)}
export DBUS_SESSION_BUS_ADDRESS=${DBUS_SESSION_BUS_ADDRESS:-unix:path=$XDG_RUNTIME_DIR/bus}
notify-send -u "$URGENCY" "Playlist Semanal" "$MESSAGE" 2>/dev/null || true

# Loga no syslog
logger -t playlist-sync "$MESSAGE"

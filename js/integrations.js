/*
 * 外部サービス連携の予約モジュール。
 *
 * YpChatは匿名Firebase認証のみをメイン認証にします。
 * Discord / Roblox / GitHub等の連携は、各サービスの
 * OAuth仕様と利用可能なAPIに合わせて後から実装できます。
 *
 * Client Secretをこのファイルへ書かないでください。
 */

export const integrations = {
    github: {
        enabled: false,
        status: "not-configured"
    },

    discord: {
        enabled: false,
        status: "not-configured"
    },

    roblox: {
        enabled: false,
        status: "not-configured"
    }
};

export function getIntegrationStatus() {
    return structuredClone(integrations);
}

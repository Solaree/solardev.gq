document.addEventListener('DOMContentLoaded', () => {
    tokenGen();
});

async function tokenGen() {
    const id = Array.from({ length: 18 }, () => Math.floor(Math.random() * 10)).join('');
    const ID_base64 = btoa(id)

    const startDate = new Date(2015, 5, 14, 0, 0, 0, 0);
    const endDate = new Date(2022, 8, 14, 23, 59, 59, 0);

    const startTime = Math.floor(startDate.getTime() / 1000);
    const endTime = Math.floor(endDate.getTime() / 1000);

    const unixTimestamp = Math.floor(Math.random() * (endTime - startTime)) + startTime - 1293840000;
    const adjusted_timestamp_bytes = new Uint8Array(new Int32Array([unixTimestamp]).buffer);
    const unixTimestamp_base64 = btoa(String.fromCharCode(...adjusted_timestamp_bytes))

    const secret_key = Array.from(crypto.getRandomValues(new Uint8Array(64)), byte => byte.toString(16).padStart(2, '0')).join('');
    const public_data = `${ID_base64}.${unixTimestamp_base64}`;
    const hmac_key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret_key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const hmac_value = await crypto.subtle.sign('HMAC', hmac_key, new TextEncoder().encode(public_data));
    const hmac_base64 = btoa(String.fromCharCode(...new Uint8Array(hmac_value)));

    const token = `${ID_base64}.${unixTimestamp_base64}.${hmac_base64}`;

    const result = {
        userId: id,
        hmacKey: secret_key,
        token: token,
        tokenLength: token.length
    };

    result.token = result.token.replace(/\//g, '_');

    // Check the token validity with Discord API
    try {
        const response = await fetch('https://discord.com/api/v10/users/@me', {
            method: 'GET',
            headers: {
                Authorization: token
            }
        });
        const tokenInfo = await response.json();

        if (response.ok) {
            result.isValid = true;
            result.response = tokenInfo;
        } else {
            result.isValid = false;
            result.response = tokenInfo;
        }
    } catch (error) {
        result.isValid = false;
    }

    const formattedResult = JSON.stringify(result, null, 4);
    document.getElementById('result').textContent = formattedResult;
}
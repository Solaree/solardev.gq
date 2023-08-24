document.addEventListener('DOMContentLoaded', () => {
    nitroGen();
});

async function nitroGen() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array.from({ length: 16 }, () => characters[Math.floor(Math.random() * characters.length)]).join('');

    const result = {
        code: code
    };

    // Check the nitro validity with Discord API
    try {
        const response = await fetch(`https://discord.com/api/v10/entitlements/gift-codes/${code}`);
        const nitroInfo = await response.json();

        if (nitroInfo.message === 'Unknown Gift Code') {
            result.isValid = false;
            result.response = nitroInfo;
        } else if (nitroInfo.message === 'The resource is being rate limited.') {
            result.isValid = false;
            result.response = nitroInfo;
        } else {
            result.isValid = true;
            result.response = nitroInfo;
        }
    } catch (error) {
        result.isValid = false;
    }

    const formattedResult = JSON.stringify(result, null, 4);
    document.getElementById('result').textContent = formattedResult;
}

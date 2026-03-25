/**
 * PayPal REST API - Fonctions serveur
 * Utilise l'API PayPal v2 directement (sans SDK)
 * Sandbox : https://api-m.sandbox.paypal.com
 * Production : https://api-m.paypal.com
 */

const PAYPAL_BASE =
	process.env.PAYPAL_ENV === "production"
		? "https://api-m.paypal.com"
		: "https://api-m.sandbox.paypal.com";

// Récupère un token OAuth2 PayPal (expire après ~9h, on en génère un à chaque appel)
async function getAccessToken(): Promise<string> {
	const clientId = process.env.PAYPAL_CLIENT_ID!;
	const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
	const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
		"base64"
	);

	const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
		method: "POST",
		headers: {
			Authorization: `Basic ${credentials}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: "grant_type=client_credentials",
	});

	const data = await res.json();
	if (!res.ok)
		throw new Error(`PayPal auth error: ${data.error_description}`);
	return data.access_token;
}

// Crée une commande PayPal et retourne l'URL d'approbation
export async function createPayPalOrder(params: {
	amount: number;
	currency?: string;
	description?: string;
	returnUrl: string;
	cancelUrl: string;
}): Promise<{ paypalOrderId: string; approvalUrl: string }> {
	const accessToken = await getAccessToken();

	const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			intent: "CAPTURE",
			purchase_units: [
				{
					amount: {
						currency_code: params.currency || "EUR",
						value: params.amount.toFixed(2),
					},
					description: params.description,
				},
			],
			application_context: {
				brand_name: "Lady Haya Wear",
				user_action: "PAY_NOW",
				return_url: params.returnUrl,
				cancel_url: params.cancelUrl,
			},
		}),
	});

	const data = await res.json();
	if (!res.ok)
		throw new Error(`PayPal create order error: ${JSON.stringify(data)}`);

	const approvalUrl = data.links?.find(
		(l: { rel: string; href: string }) => l.rel === "approve"
	)?.href;

	if (!approvalUrl) throw new Error("PayPal: URL d'approbation manquante");

	return { paypalOrderId: data.id, approvalUrl };
}

// Capture le paiement après approbation de l'utilisateur
export async function capturePayPalOrder(
	paypalOrderId: string
): Promise<{ status: string; captureId: string }> {
	const accessToken = await getAccessToken();

	const res = await fetch(
		`${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		}
	);

	const data = await res.json();
	if (!res.ok)
		throw new Error(`PayPal capture error: ${JSON.stringify(data)}`);

	const captureId =
		data.purchase_units?.[0]?.payments?.captures?.[0]?.id || "";

	return { status: data.status, captureId };
}

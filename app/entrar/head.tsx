// app/entrar/head.tsx
export default function Head() {
	return (
		<>
			{/* <script
				src="https://challenges.cloudflare.com/turnstile/v0/api.js"
				async
				defer
			></script> */}
			<script
				src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
				defer
			></script>
		</>
	);
}

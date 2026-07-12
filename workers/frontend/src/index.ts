export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    const asset = await env.ASSETS.fetch(request.clone());
    if (asset.status !== 404) return asset;

    const index = await env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request.clone()));
    if (index.status !== 404) return new Response(await index.text(), {
      status: 200,
      headers: { 'content-type': 'text/html;charset=utf-8' },
    });

    return new Response('Not Found', { status: 404 });
  },
};

interface Env {
  ASSETS: Fetcher;
}

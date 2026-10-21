# API notes

Findings from real requests to `https://itx-frontend-test.onrender.com` on 2026-10-21: the product list, the detail of all 100 products and the cart endpoint, from the command line and from the app running on `localhost:5173`. The responses in [`src/test/fixtures/`](../src/test/fixtures/) are real and back the tests.

## Endpoints

| Request                                   | Response                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------- |
| `GET /api/product`                        | 200 with an array of 100 products: `id`, `brand`, `model`, `price` and `imgUrl` |
| `GET /api/product/:id`                    | 200 with the product: the same five fields, 32 more and `options`               |
| `GET /api/product/:id` with an unknown id | **500** with `{"message":"An Unexpected Error Occurred","code":0}`, never 404   |
| `POST /api/cart`                          | 200 with `{"count": n}` (see [Cart](#cart))                                     |
| `POST /api/cart` with a missing field     | 400 with `{"message":"Invalid parameters","code":0}`                            |

Since an unknown product answers 500, the app cannot tell a missing product from a server failure. Both show the same error, with a way to retry and a link back to the list.

## Cold start

The API runs on a free Render instance, which [Render](https://render.com/docs/free) shuts down after 15 minutes without traffic and starts again on the next request, a process that "takes about one minute". The first request took **52.5 s** and **42.5 s** on two occasions, and **more than 60 s** on a third, when the client gave up at 60 s and the server answered in 0.24 s moments later. Once awake, the list and every detail answer in under 100 ms.

The wait happens on the server and the app cannot shorten it. It can avoid it with the cache, start requests as early as possible, tell the user that the server is waking up, and keep its timeout above the longest cold start.

## Headers

- Every response, and the preflight of `POST /api/cart`, carries `Access-Control-Allow-Origin: *`, so the API can be called from any origin, `localhost` included.
- There is no `Access-Control-Allow-Credentials`, so the browser never sends cookies to the API (see [Cart](#cart)).
- Responses carry a weak `ETag` but no `Cache-Control`, and images come with `Cache-Control: public, max-age=0`. The HTTP cache of the browser does not avoid requests, which is what the client cache asked by the statement is for.

## Product list

- 100 products with unique string ids such as `ZmGrkLRPXOTpxsU4jjAcv`, not numbers like the `0001` in the statement.
- Two brands: Acer (99 products) and alcatel (1), the latter in lower case.
- `price` is a string of digits, such as `"170"`, and is empty in 6 products. It comes without currency, so it is shown in euros.
- `imgUrl` is an absolute URL to a JPEG of about 8 KB on the same host.
- `brand`, `model`, `price` and `imgUrl` are identical in the list and in the detail of every product.

## Product detail

The attributes the statement asks for, with every shape found across the 100 products:

| Attribute         | API field                             | Shapes found                                                                      |
| ----------------- | ------------------------------------- | --------------------------------------------------------------------------------- |
| Brand, model      | `brand`, `model`                      | Always a string                                                                   |
| Price             | `price`                               | String of digits (94), empty (6)                                                  |
| CPU               | `cpu`                                 | String (97), list (2), empty (1)                                                  |
| RAM               | `ram`                                 | String (96), list (1), empty (3)                                                  |
| Operating system  | `os`                                  | String (89), list (11)                                                            |
| Screen resolution | **`displaySize`**                     | Always a string such as `"720 x 1280 pixels (~210 ppi pixel density)"`            |
| Battery           | `battery`                             | String (99), empty (1)                                                            |
| Cameras           | `primaryCamera`, **`secondaryCmera`** | String or list of up to 5 items, with empty items; the front camera can be `"No"` |
| Dimensions        | **`dimentions`**                      | String (98), `"-"` (2)                                                            |
| Weight            | `weight`                              | String of digits without unit, such as `"260"` (93), empty (7)                    |

Irregularities the mappers absorb so they never reach the UI:

- **Misspelt fields:** `secondaryCmera` and `dimentions`.
- **Swapped fields:** `displayResolution` holds the screen size (`"7.0 inches (~69.8% screen-to-body ratio)"`) and `displaySize` holds the resolution, in all 100 products.
- **A string or a list** for the same field, and lists with empty items.
- **Empty values** as `""` or `"-"`.
- **No unit** in the weight, which is in grams.

`options` lists the choices for the cart as `{ code, name }`. Codes are integers, colours from 1000 and storages from 2000, unique within each product:

- **Colours:** one option in 47 products, two in 43, and up to 9.
- **Storages:** one option in 80 products, and up to 3.

The other 22 fields (network, SIM, chipset, GPU, memory, connectivity, sensors, release status…) follow the same string-or-list patterns and are not required by the statement.

## Cart

- The body is `{ id, colorCode, storageCode }`, with the numeric codes of `options`. A missing field answers 400, but nothing else is validated: an unknown product id answers 200.
- The server keeps the cart in a session identified by an `HttpOnly` cookie, `session_id`. When the cookie is sent back, as `curl` does with a cookie jar, `count` grows: 1, 2, 3.
- **From the browser, that cookie never travels.** Requests with credentials are blocked because the API answers `Access-Control-Allow-Origin: *`, and requests without them start a new session every time. From `localhost:5173`, `count` is always 1.

So the response does not give a browser the total of the cart. How the app keeps the counter is decided in an ADR when the cart is built.

## Fixtures

| File                                                                                    | Content                                                                                              |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [`products.json`](../src/test/fixtures/products.json)                                   | The full product list                                                                                |
| [`product-detail.json`](../src/test/fixtures/product-detail.json)                       | Acer Iconia Tab A700: two colours, three storages and a front camera reported as `"Yes"`             |
| [`product-detail-incomplete.json`](../src/test/fixtures/product-detail-incomplete.json) | Acer Liquid Jade 2: empty price, battery and weight, `"-"` as dimensions, one colour and one storage |

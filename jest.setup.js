require('@testing-library/jest-dom');
const { TextEncoder, TextDecoder } = require('node:util')
const { ReadableStream, WritableStream, TransformStream } = require('node:stream/web')
const { Blob, File } = require('node:buffer')
const fetch = require('node-fetch')

if (!global.TextEncoder) global.TextEncoder = TextEncoder
if (!global.TextDecoder) global.TextDecoder = TextDecoder
if (!global.ReadableStream) global.ReadableStream = ReadableStream
if (!global.WritableStream) global.WritableStream = WritableStream
if (!global.TransformStream) global.TransformStream = TransformStream
if (!global.Blob) global.Blob = Blob
if (!global.File) global.File = File
if (!global.fetch) global.fetch = fetch
if (!global.Headers) global.Headers = fetch.Headers
if (!global.Request) global.Request = fetch.Request
if (!global.Response) global.Response = fetch.Response

const { server } = require('./__tests__/msw/server')

process.env.REDIS_URL ??= 'redis://localhost:6379';

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}

if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}

if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

jest.mock('@/lib/supabase/ssr', () => {
  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  }

  const client = {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      updateUser: jest.fn().mockResolvedValue({ data: null, error: null }),
    },
    from: jest.fn(() => queryBuilder),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: null, error: null }),
        remove: jest.fn().mockResolvedValue({ data: null, error: null }),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: '' } })),
      })),
    },
  }

  return {
    createClientComponentClient: jest.fn(() => client),
    createRouteHandlerClient: jest.fn(() => client),
    createServerComponentClient: jest.fn(() => client),
  }
});

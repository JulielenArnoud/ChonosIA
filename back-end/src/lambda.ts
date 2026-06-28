import app from './app';

export const handler = async (event: any, context: any) => {
  const { httpMethod, path, body, headers, queryStringParameters } = event;

  const req = {
    method: httpMethod,
    path,
    body: body ? JSON.parse(body) : {},
    headers: headers || {},
    query: queryStringParameters || {},
  };

  const res = {
    statusCode: 200,
    body: '',
    headers: { 'Content-Type': 'application/json' },
  };

  const expressApp = app as any;
  const mockReq = req;
  const mockRes = {
    statusCode: 200,
    setHeader: () => {},
    json: (payload: any) => {
      res.body = JSON.stringify(payload);
      res.statusCode = 200;
      return res;
    },
    status: (code: number) => {
      res.statusCode = code;
      return mockRes;
    },
    send: (payload: any) => {
      res.body = typeof payload === 'string' ? payload : JSON.stringify(payload);
      return res;
    },
  };

  const mockNext = () => {};

  try {
    await new Promise((resolve, reject) => {
      expressApp.handle(mockReq, mockRes, (err?: unknown) => {
        if (err) return reject(err);
        resolve(undefined);
      });
    });
  } catch (error) {
    res.statusCode = 500;
    res.body = JSON.stringify({ message: (error as Error).message });
  }

  return res;
};

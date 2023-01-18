import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { Readable, Transform } from 'node:stream';
import { WritableStream } from 'node:stream/web';
import { setTimeout } from 'node:timers/promises';

import csvtojson from 'csvtojson';

const PORT = 3030;

createServer(async (request, response) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow_Methods': '*',
  };

  if (request.method === 'OPTIONS') {
    response.writeHead(204, headers);
    response.end('ok1');
    return;
  }

  request.once('close', () => console.log('connection was closed', items));

  let items = 0;

  Readable.toWeb(createReadStream('./animeflv.csv'))
    .pipeThrough(Transform.toWeb(csvtojson()))
    .pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          const data = JSON.parse(Buffer.from(chunk));
          controller.enqueue(
            JSON.stringify({
              title: data.title,
              description: data.description,
              url_anime: data.url_anime,
            }).concat('\n')
          );
        },
      })
    )
    .pipeTo(
      new WritableStream({
        async write(chunk) {
          await setTimeout(200);
          items++;
          response.write(chunk);
        },
        close() {
          response.end;
        },
      })
    );
  response.writeHead(200, headers);
}).listen(PORT, () => console.log(`server running at ${PORT}`));

import dns from 'dns';

dns.resolveSrv(
  '_mongodb._tcp.cluster0.v8xwecs.mongodb.net',
  (err, records) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(records);
  }
);
db = db.getSiblingDB('vehicle-watchlist');

db.createUser({
  user: 'vehicle_user',
  pwd: 'vehicle_pass',
  roles: [
    {
      role: 'readWrite',
      db: 'vehicle-watchlist',
    },
  ],
});

db.createCollection('users');
print('Database vehicle-watchlist initialized successfully');

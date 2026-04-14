import redis

r = redis.Redis()

def join_queue(user):
    r.lpush("queue", user)
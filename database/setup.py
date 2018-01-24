from pymongo import MongoClient

#Connects to port 27017 on localhost on defult unless specified in the parameters
client = MongoClient()

#Connects to a certain database off the running 'mongod' instance
db = client.test

result = db.samples.insert_one(
    {
        "info": {
            "name": "test-name",
            "something": "test-something"
        }
    }
)

print("Succesfull insert of id: ", result.inserted_id)

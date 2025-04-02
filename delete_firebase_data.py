import firebase_admin # type: ignore
from firebase_admin import credentials, firestore # type: ignore
import os

# Initialize Firebase
if os.path.exists("firebase-key.json"):
    cred = credentials.Certificate("firebase-key.json")
    firebase_admin.initialize_app(cred)
else:
    firebase_admin.initialize_app()

db = firestore.client()

def delete_collection(collection_name, batch_size=50):
    """Delete all documents in a collection"""
    print(f"Deleting all documents in '{collection_name}' collection...")
    
    # Get a reference to the collection
    coll_ref = db.collection(collection_name)
    
    # Get all documents in batches to avoid timeout
    docs = coll_ref.limit(batch_size).stream()
    deleted = 0
    
    # Delete documents in batch
    for doc in docs:
        print(f"  Deleting document: {doc.id}")
        doc.reference.delete()
        deleted += 1
    
    if deleted >= batch_size:
        # If we deleted a full batch, there might be more
        return delete_collection(collection_name, batch_size)
    
    print(f"Deleted {deleted} documents from '{collection_name}'")
    return deleted

if __name__ == "__main__":
    # You can specify which collections to delete
    collections_to_delete = ["games", "users", "reviews", "lists", "activities"]
    
    # Ask for confirmation
    print("WARNING: This will delete data from the following collections:")
    for coll in collections_to_delete:
        print(f"- {coll}")
    
    confirm = input("Are you sure you want to proceed? (yes/no): ")
    
    if confirm.lower() == "yes":
        total_deleted = 0
        for collection in collections_to_delete:
            total_deleted += delete_collection(collection)
        
        print(f"\nDeletion complete. Removed {total_deleted} documents in total.")
    else:
        print("Operation cancelled.")
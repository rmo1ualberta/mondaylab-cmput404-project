
from enum import unique
from django.db.models import (Model, URLField, CharField, ForeignKey, OneToOneField,CASCADE)
from author.models import Author
from comments.models import Comment
from post.models import Post
from like.models import Like
from followers.models import FriendRequest
# Create your models here.
class Inbox(Model):
    """
    items will save all types of posts
    if the type is “post” then add that post to AUTHOR_ID’s inbox
    if the type is “follow” then add that follow is added to AUTHOR_ID’s inbox to approve later
    if the type is “like” then add that like to AUTHOR_ID’s inbox
    if the type is “comment” then add that comment to AUTHOR_ID’s inbox
    """
    type = CharField(max_length=10, default="inbox", editable=False)
    id = OneToOneField(Author, primary_key=True, on_delete=CASCADE, null=False)
    post = ForeignKey(Post,on_delete=CASCADE,null=True)
    follow_request= ForeignKey(FriendRequest, related_name='follow_requests', on_delete=CASCADE, null=True)
    like = ForeignKey(Like, on_delete=CASCADE,null=True)
    comment = ForeignKey(Comment,on_delete=CASCADE,null=True)
    

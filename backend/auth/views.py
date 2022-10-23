from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status, viewsets
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from auth.serializers import LoginSerializer, RegisterSerializer
from uuid import uuid4
from author.models import Author

class LoginViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class RegistrationViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request':request})

        # check if displayName already exists, if not return error
        requestedDisplayName = request.data.get("displayName")
        authorExists = Author.objects.filter(displayName=requestedDisplayName).first()
        if authorExists != None:
            return Response(data=f"Author with displayName = {requestedDisplayName} already exists!", status=status.HTTP_400_BAD_REQUEST)

        serializer.is_valid(raise_exception=True)

        # add in host, id, url, uuid from here since we can't access request object from the model
        host = request.build_absolute_uri('/')[:-1]
        uuid = str(uuid4())
        url =str(host) +'/authors/'+ uuid
        serializer.validated_data['host'] = host+'/'
        serializer.validated_data['url'] = url
        serializer.validated_data['id'] = url
        serializer.validated_data['uuid'] = uuid
        
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        res = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

        return Response({
            "user": serializer.data,
            "refresh": res["refresh"],
            "token": res["access"]
        }, status=status.HTTP_201_CREATED)


class RefreshViewSet(viewsets.ViewSet, TokenRefreshView):
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)
# Project Boilerplate
# g8-yatch

## Authentication

The app signs users in through Keycloak. Users can log in with the email/password account created in Keycloak, and Google login can be enabled as an optional Keycloak identity provider.

To enable Google login locally:

1. Create an OAuth client in Google Cloud Console.
2. Add this authorized redirect URI:
   `http://localhost:8081/realms/g8-yacht/broker/google/endpoint`
3. Put the credentials in `backend/.env`:
   `KEYCLOAK_GOOGLE_CLIENT_ID=...`
   `KEYCLOAK_GOOGLE_CLIENT_SECRET=...`
4. Run `backend/setup_keycloak.py` again.

For production, use the public Keycloak URL in the Google redirect URI, for example:
`https://auth.example.com/realms/g8-yacht/broker/google/endpoint`

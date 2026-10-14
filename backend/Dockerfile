# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY backend/FirefightersSP.Backend.csproj ./
COPY backend/src/ ./src/
COPY backend/appsettings.json ./

# Restore dependencies
RUN dotnet restore "FirefightersSP.Backend.csproj"

# Build the application
RUN dotnet build "FirefightersSP.Backend.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "FirefightersSP.Backend.csproj" -c Release -o /app/publish

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copy published app
COPY --from=publish /app/publish ./

# Copy appsettings for production
COPY backend/appsettings.Production.json ./appsettings.Production.json

# Set entry point
ENTRYPOINT ["dotnet", "FirefightersSP.Backend.dll"]

# Expose ports
EXPOSE 80
EXPOSE 443

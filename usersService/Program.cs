using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using usersService.Data;
using usersService.Mutation;
using usersService.Query;
using usersService.Services;
using HotChocolate.AspNetCore;
using usersService.Schema.Mutations;
using usersService.Schema.Subscriptions;
using HotChocolate.Types;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<ChattingRepository>();
builder.Services.AddScoped<MessageRepository>();
builder.Services.AddScoped<LocationRepository>();
builder.Services.AddScoped<KidRepository>();
builder.Services.AddScoped<LanguageRepository>();


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddGraphQLServer()
    .AddQueryType<RootQuery>()
    .AddMutationType<RootMutation>()
    .AddSubscriptionType<RootSubscription>()
    .AddFiltering()
    .AddSorting()
    .AddAuthorization()
    .AddType<UploadType>()
    .AddMutationConventions()
    .AddInMemorySubscriptions();


// .AddType<usersService.Type.UserType>()
// .AddProjections()
// .AddFiltering()
// .AddSorting();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"])),
        ValidIssuer = builder.Configuration["JWT:Issuer"],
        ValidateIssuer = true,
        ValidateAudience = false
    };
});
builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowMyOrigin",
            builder => builder.WithOrigins("https://localhost:4200")
                              .AllowAnyHeader()
                              .AllowCredentials()
                              .AllowAnyMethod());
    });

builder.Services.AddDbContext<AppDBContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("Database"));
});


var app = builder.Build();
app.UseWebSockets();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowMyOrigin");

// app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseEndpoints(endpoints =>
{
    _ = endpoints.MapGraphQL();
});
// app.MapGraphQL();

app.Run();

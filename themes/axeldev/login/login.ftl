<!DOCTYPE html>
<html>
<head>
    <title>AxelDev Login</title>
    <link rel="stylesheet" type="text/css" href="resources/css/login.css" />
</head>
<body>
    <div class="login-container">
        <img src="resources/img/logo.png" alt="Logo" class="logo"/>
        <h1>Welcome to AxelDev</h1>

        <#-- Render the actual Keycloak login form from the base theme -->
        <#include "template.ftl" />
    </div>
</body>
</html>

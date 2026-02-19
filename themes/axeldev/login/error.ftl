<!DOCTYPE html>
<html lang="${locale.currentLanguageTag}">
<head>
  <meta charset="utf-8" />
  <title>Error · Axel Dev Lab</title>
</head>
<body>
  <h2>Error</h2>
  <#if message?? && message.summary??>
    <p>${kcSanitize(message.summary)?no_esc}</p>
  <#else>
    <p>An unexpected error occurred.</p>
  </#if>
</body>
</html>

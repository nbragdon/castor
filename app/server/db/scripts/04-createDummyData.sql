DO $$
  DECLARE default_env TEXT;
  DECLARE dev_env TEXT;
  DECLARE prod_env TEXT;
  DECLARE nick_dev_env TEXT;
  DECLARE nathan_dev_env TEXT;
  DECLARE grant_dev_env TEXT;

  DECLARE web_context TEXT;
  DECLARE voice_context TEXT;
  DECLARE api_context TEXT;
  DECLARE message_context TEXT;

  DECLARE port TEXT;
  DECLARE url TEXT;
  DECLARE prop1 TEXT;
  DECLARE prop2 TEXT;
  DECLARE prop3 TEXT;
  DECLARE prop4 TEXT;
  DECLARE prop5 TEXT;
  DECLARE prop6 TEXT;

  DECLARE nick TEXT;

  DECLARE default_env_id INTEGER;
  DECLARE dev_env_id INTEGER;
  DECLARE prod_env_id INTEGER;
  DECLARE nick_env_id INTEGER;
  DECLARE nathan_env_id INTEGER;
  DECLARE grant_env_id INTEGER;

  DECLARE default_web_context_id INTEGER;
  DECLARE default_voice_context_id INTEGER;
  DECLARE default_api_context_id INTEGER;
  DECLARE default_message_context_id INTEGER;

  DECLARE dev_web_context_id INTEGER;
  DECLARE dev_voice_context_id INTEGER;
  DECLARE dev_api_context_id INTEGER;

  DECLARE prod_web_context_id INTEGER;
  DECLARE prod_voice_context_id INTEGER;
  DECLARE prod_api_context_id INTEGER;

  DECLARE nick_web_context_id INTEGER;
  DECLARE grant_web_context_id INTEGER;
  DECLARE grant_message_context_id INTEGER;
  DECLARE nathan_web_context_id INTEGER;

BEGIN
  default_env := 'default';
  dev_env := 'dev';
  prod_env := 'prod';
  nick_dev_env := 'nick-dev';
  nathan_dev_env := 'nathan-dev';
  grant_dev_env := 'grant-dev';

  web_context := 'web';
  voice_context := 'voice';
  api_context := 'api';
  message_context := 'message';

  port := '8001';
  url := 'https://catapult.com';
  prop1 := 'prop1';
  prop2 := 'prop2';
  prop3 := 'prop3';
  prop4 := 'prop4';
  prop5 := 'prop5';
  prop6 := 'prop6';

  nick := 'nick';

  -- This is setting up the default env
  INSERT INTO environments (name, creation_user) VALUES (default_env, nick) RETURNING id INTO default_env_id;

  INSERT INTO contexts (name, parent, creation_user) VALUES (web_context, default_env_id, nick) RETURNING id INTO default_web_context_id;
  INSERT INTO contexts (name, parent, creation_user) VALUES (voice_context, default_env_id, nick) RETURNING id INTO default_voice_context_id;
  INSERT INTO contexts (name, parent, creation_user) VALUES (api_context, default_env_id, nick) RETURNING id INTO default_api_context_id;
  INSERT INTO contexts (name, parent, creation_user) VALUES (message_context, default_env_id, nick) RETURNING id INTO default_message_context_id;

  INSERT INTO properties (name, value, parent, creation_user) VALUES ('port', port, default_web_context_id, nick);
  INSERT INTO properties (name, value, parent, creation_user) VALUES ('url', url, default_web_context_id, nick);
  INSERT INTO properties (name, value, parent, creation_user, override_required) VALUES (prop1, NULL, default_web_context_id, nick, true);

  INSERT INTO properties (name, value, parent, creation_user, override_required) VALUES (prop2, NULL, default_voice_context_id, nick, true);
  INSERT INTO properties (name, value, parent, creation_user, override_required) VALUES (prop3, NULL, default_voice_context_id, nick, true);

  INSERT INTO properties (name, value, parent, creation_user) VALUES (prop2, prop2, default_api_context_id, nick);
  INSERT INTO properties (name, value, parent, creation_user, override_required) VALUES ('url', NULL, default_api_context_id, nick, true);
  INSERT INTO properties (name, value, parent, creation_user) VALUES ('port', port, default_api_context_id, nick);

  INSERT INTO properties (name, value, parent, creation_user) VALUES (prop4, prop4, default_message_context_id, nick);
  INSERT INTO properties (name, value, parent, creation_user) VALUES (prop5, prop5, default_message_context_id, nick);
  ------------------------------------------


  -- This is setting up the dev environment
  INSERT INTO environments (name, inherits, creation_user) VALUES (dev_env, default_env_id, nick) RETURNING id INTO dev_env_id;

  INSERT INTO contexts (name, parent, creation_user) VALUES (web_context, dev_env_id, nick) RETURNING id INTO dev_web_context_id;
  INSERT INTO contexts (name, parent, creation_user) VALUES (voice_context, dev_env_id, nick) RETURNING id INTO dev_voice_context_id;
  INSERT INTO contexts (name, parent, creation_user) VALUES (api_context, dev_env_id, nick) RETURNING id INTO dev_api_context_id;

  INSERT INTO properties (name, value, parent, creation_user, override_required) VALUES (prop1, NULL, dev_web_context_id, nick, true);
  INSERT INTO properties (name, value, parent, creation_user) VALUES ('port', '5555', dev_web_context_id, nick);

  INSERT INTO properties (name, value, parent, creation_user) VALUES (prop2, prop2, dev_voice_context_id, nick);
  INSERT INTO properties (name, value, parent, creation_user) VALUES (prop3, prop3, dev_voice_context_id, nick);

  INSERT INTO properties (name, value, parent, creation_user) VALUES ('url', url, dev_api_context_id, nick);
  ------------------------------------------


  -- This is setting up the prod environment
  INSERT INTO environments (name, inherits, creation_user) VALUES (prod_env, default_env_id, nick) RETURNING id INTO prod_env_id;

  INSERT INTO contexts (name, parent, creation_user) VALUES (web_context, prod_env_id, nick) RETURNING id INTO prod_web_context_id;
  INSERT INTO contexts (name, parent, creation_user) VALUES (voice_context, prod_env_id, nick) RETURNING id INTO prod_voice_context_id;
  INSERT INTO contexts (name, parent, creation_user) VALUES (api_context, prod_env_id, nick) RETURNING id INTO prod_api_context_id;

  INSERT INTO properties (name, value, parent, creation_user) VALUES (prop1, 'prod1', prod_web_context_id, nick);

  INSERT INTO properties (name, value, parent, creation_user) VALUES (prop2, 'prod2', prod_voice_context_id, nick);
  INSERT INTO properties (name, value, parent, creation_user) VALUES (prop3, 'prod3', prod_voice_context_id, nick);

  INSERT INTO properties (name, value, parent, creation_user) VALUES ('url', 'prod-url', prod_api_context_id, nick);
  ------------------------------------------


  -- This is setting up the Nick environment
  INSERT INTO environments (name, inherits, creation_user) VALUES (nick_dev_env, dev_env_id, nick) RETURNING id INTO nick_env_id;

  INSERT INTO contexts (name, parent, creation_user) VALUES (web_context, nick_env_id, nick) RETURNING id INTO nick_web_context_id;

  INSERT INTO properties (name, value, parent, creation_user) VALUES (prop1, prop1, nick_web_context_id, nick);
  INSERT INTO properties (name, value, parent, creation_user) VALUES ('url', 'nick-url', nick_web_context_id, nick);
  ------------------------------------------


  -- This is setting up the Grant environment
  INSERT INTO environments (name, inherits, creation_user) VALUES (grant_dev_env, dev_env_id, nick) RETURNING id INTO grant_env_id;

  INSERT INTO contexts (name, parent, creation_user) VALUES (web_context, grant_env_id, nick) RETURNING id INTO grant_web_context_id;
  INSERT INTO contexts (name, parent, creation_user) VALUES (message_context, grant_env_id, nick) RETURNING id INTO grant_message_context_id;

  INSERT INTO properties (name, value, parent, creation_user) VALUES (prop1, prop1, grant_web_context_id, nick);
  INSERT INTO properties (name, value, parent, creation_user) VALUES (prop4, 'grant-prop4', grant_message_context_id, nick);
  ------------------------------------------


  -- This is setting up the Nathan environment
  INSERT INTO environments (name, inherits, creation_user) VALUES (nathan_dev_env, dev_env_id, nick) RETURNING id INTO nathan_env_id;

  INSERT INTO contexts (name, parent, creation_user) VALUES (web_context, nathan_env_id, nick) RETURNING id INTO nathan_web_context_id;

  INSERT INTO properties (name, value, parent, creation_user) VALUES (prop1, prop1, nathan_web_context_id, nick);
  ------------------------------------------
END $$;
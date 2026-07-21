-- Forge AI: Remove Prototype Agent entirely

DELETE FROM agent_results WHERE agent_key = 'prototype';

ALTER TABLE agent_results DROP CONSTRAINT IF EXISTS agent_results_agent_key_check;

ALTER TABLE agent_results
  ADD CONSTRAINT agent_results_agent_key_check
  CHECK (agent_key IN (
    'research', 'market', 'finance', 'product',
    'legal', 'debate', 'ceo'
  ));

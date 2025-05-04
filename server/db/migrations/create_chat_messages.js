module.exports = async function(client) {
  // Check if chat_messages table already exists
  const tableExists = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = 'chat_messages'
    );
  `);
  
  if (tableExists.rows[0].exists) {
    console.log('Table chat_messages already exists, skipping creation');
    return;
  }
  
  console.log('Creating chat_messages table...');
  
  // Create the chat_messages table
  await client.query(`
    CREATE TABLE chat_messages (
      id SERIAL PRIMARY KEY,
      post_id VARCHAR(255) NOT NULL,
      post_type VARCHAR(50) NOT NULL,
      sender_id VARCHAR(255) NOT NULL,
      receiver_id VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'text',
      is_read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      customer_id VARCHAR(255)
    );
    
    -- Add indexes for faster queries
    CREATE INDEX idx_chat_messages_post_id ON chat_messages(post_id);
    CREATE INDEX idx_chat_messages_post_type ON chat_messages(post_type);
    CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
    CREATE INDEX idx_chat_messages_receiver_id ON chat_messages(receiver_id);
    CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
  `);
  
  console.log('chat_messages table created successfully');
}; 
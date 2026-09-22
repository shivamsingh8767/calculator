import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Formula from '../models/Formula.js';
import { FORMULAS_DATA } from '../../js/formula-data.js';

// Load environment variables
dotenv.config();

const seedFormulas = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('USERNAME:PASSWORD@CLUSTER')) {
    console.error('\x1b[31m[Seed Error]\x1b[0m MONGODB_URI is not configured in .env. Please set a valid connection string.');
    process.exit(1);
  }

  try {
    console.log('\x1b[36m[Seed]\x1b[0m Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('\x1b[32m[Seed]\x1b[0m Connected to database successfully.');

    console.log(`\x1b[36m[Seed]\x1b[0m Processing ${FORMULAS_DATA.length} formulas from MATH/OS dataset...`);

    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of FORMULAS_DATA) {
      const filter = {
        title: item.title,
        topic: item.topic,
      };

      const update = {
        topicId: item.topicId || '',
        topic: item.topic,
        subtopic: item.subtopic,
        title: item.title,
        formula: item.formula,
        description: item.description || '',
        example: item.example || '',
        tags: Array.isArray(item.tags) ? item.tags : [],
      };

      const result = await Formula.findOneAndUpdate(filter, update, {
        upsert: true,
        new: true,
        rawResult: true,
      });

      if (result.lastErrorObject && result.lastErrorObject.updatedExisting) {
        updatedCount++;
      } else {
        insertedCount++;
      }
    }

    const totalInDb = await Formula.countDocuments();

    console.log('\n\x1b[32m==================================================\x1b[0m');
    console.log(`\x1b[32m[Seed Completed Successfully]\x1b[0m`);
    console.log(`  - Newly Inserted: ${insertedCount}`);
    console.log(`  - Updated / Verified: ${updatedCount}`);
    console.log(`  - Total Formulas in DB: ${totalInDb}`);
    console.log('\x1b[32m==================================================\x1b[0m\n');

    await mongoose.disconnect();
    console.log('[Seed] Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m[Seed Error]\x1b[0m Failed to seed database:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedFormulas();

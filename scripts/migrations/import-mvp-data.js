#!/usr/bin/env node

/**
 * Migration Script: Import MVP Data to Production Database
 * 
 * Usage:
 *   1. Export data from MVP (see MIGRATION.md)
 *   2. Place exported JSON in this directory as 'data.json'
 *   3. Run: node import-mvp-data.js --email user@example.com --password YourPassword
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Parse command line arguments
const args = process.argv.slice(2);
const email = args[args.indexOf('--email') + 1];
const password = args[args.indexOf('--password') + 1];

if (!email || !password) {
  console.error('❌ Error: --email and --password are required');
  console.log('Usage: node import-mvp-data.js --email user@example.com --password YourPassword');
  process.exit(1);
}

async function importData() {
  try {
    // Check if data file exists
    const dataPath = path.join(__dirname, 'data.json');
    if (!fs.existsSync(dataPath)) {
      console.error('❌ Error: data.json not found');
      console.log('Please export your MVP data first (see MIGRATION.md)');
      process.exit(1);
    }

    // Read export file
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    console.log('📦 Starting data import...');
    console.log(`   Tasks: ${data.tasks?.length || 0}`);
    console.log(`   Stats entries: ${Object.keys(data.stats || {}).length}`);
    console.log('');

    // Create user
    console.log('👤 Creating user account...');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: data.userName || 'Migrated User',
        createdAt: new Date(data.exportedAt || Date.now()),
      },
    });
    
    console.log(`✅ Created user: ${user.email} (ID: ${user.id})`);
    console.log('');

    // Import tasks
    if (data.tasks && data.tasks.length > 0) {
      console.log('📝 Importing tasks...');
      let importedTasks = 0;
      let skippedTasks = 0;

      for (const task of data.tasks) {
        try {
          // Map MVP status to production status
          const status = task.status === 'active' ? 'ACTIVE' : 'COMPLETED';
          
          // Map MVP priority to production priority
          let priority = 'MEDIUM';
          if (task.priority === 'high') priority = 'HIGH';
          if (task.priority === 'low') priority = 'LOW';

          await prisma.task.create({
            data: {
              userId: user.id,
              title: task.title,
              dueDate: task.dueDate ? new Date(task.dueDate) : null,
              priority: priority,
              status: status,
              createdAt: new Date(task.createdAt),
              completedAt: task.completedAt ? new Date(task.completedAt) : null,
              focusSessionsCount: task.focusSessionsCount || 0,
            },
          });
          importedTasks++;
          
          if (importedTasks % 10 === 0) {
            process.stdout.write(`   Imported ${importedTasks} tasks...\r`);
          }
        } catch (error) {
          console.error(`   ⚠️  Skipped task "${task.title}": ${error.message}`);
          skippedTasks++;
        }
      }
      
      console.log(`✅ Imported ${importedTasks} tasks (${skippedTasks} skipped)`);
      console.log('');
    }

    // Import stats
    if (data.stats && Object.keys(data.stats).length > 0) {
      console.log('📊 Importing daily stats...');
      let importedStats = 0;
      let skippedStats = 0;

      for (const [dateStr, stat] of Object.entries(data.stats)) {
        try {
          await prisma.dailyStat.create({
            data: {
              userId: user.id,
              date: new Date(dateStr),
              tasksCompleted: stat.completed || 0,
              focusSessions: stat.sessions || 0,
              focusMinutes: 0, // Not tracked in MVP
              streakCount: 0, // Will be recalculated
            },
          });
          importedStats++;
          
          if (importedStats % 10 === 0) {
            process.stdout.write(`   Imported ${importedStats} stats...\r`);
          }
        } catch (error) {
          console.error(`   ⚠️  Skipped stat for ${dateStr}: ${error.message}`);
          skippedStats++;
        }
      }
      
      console.log(`✅ Imported ${importedStats} daily stats (${skippedStats} skipped)`);
      console.log('');
    }

    // Calculate current streak
    console.log('🔥 Calculating streak...');
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const stats = await prisma.dailyStat.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: new Date(dateStr),
          },
        },
      });

      if (stats && stats.tasksCompleted > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }

      if (streak > 365) break; // Safety limit
    }

    console.log(`✅ Current streak: ${streak} days`);
    console.log('');

    // Summary
    const taskCount = await prisma.task.count({ where: { userId: user.id } });
    const activeTaskCount = await prisma.task.count({ where: { userId: user.id, status: 'ACTIVE' } });
    const completedTaskCount = await prisma.task.count({ where: { userId: user.id, status: 'COMPLETED' } });
    const statsCount = await prisma.dailyStat.count({ where: { userId: user.id } });

    console.log('🎉 Migration complete!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   User: ${user.email}`);
    console.log(`   Total tasks: ${taskCount}`);
    console.log(`   Active tasks: ${activeTaskCount}`);
    console.log(`   Completed tasks: ${completedTaskCount}`);
    console.log(`   Daily stats: ${statsCount}`);
    console.log(`   Current streak: ${streak} days`);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Login to the web app: http://localhost:3000');
    console.log(`   2. Use credentials: ${email} / ${password}`);
    console.log('   3. Verify your data looks correct');
    console.log('');

    // Create credentials file
    const credsPath = path.join(__dirname, 'credentials.txt');
    fs.writeFileSync(
      credsPath,
      `FocusFlow Production Credentials\n` +
      `================================\n\n` +
      `Email: ${email}\n` +
      `Password: ${password}\n\n` +
      `IMPORTANT: Delete this file after logging in!\n`
    );
    console.log(`💾 Credentials saved to: ${credsPath}`);
    console.log('   (Delete this file after logging in!)');

  } catch (error) {
    console.error('');
    console.error('❌ Migration failed:', error.message);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
console.log('');
console.log('╔══════════════════════════════════════════╗');
console.log('║  FocusFlow MVP → Production Migration   ║');
console.log('╚══════════════════════════════════════════╝');
console.log('');

importData();

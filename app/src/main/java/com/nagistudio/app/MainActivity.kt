package com.nagistudio.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.filled.AccountTree
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Ink = Color(0xFF24243A)
private val Purple = Color(0xFF7061E9)
private val Page = Color(0xFFF7F8FC)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = lightColorScheme(primary = Purple, background = Page)) {
                NagiStudioApp()
            }
        }
    }
}

@Composable
fun NagiStudioApp() {
    var selected by remember { mutableStateOf("Overview") }
    var showCreate by remember { mutableStateOf(false) }
    var botName by remember { mutableStateOf("") }
    var bots by remember { mutableStateOf(listOf("Community Helper", "Welcome Assistant", "Support Flow")) }

    Scaffold(containerColor = Page, bottomBar = {
        NavigationBar(containerColor = Color.White) {
            listOf("Overview", "My bots", "Flow builder", "Settings").forEach { item ->
                NavigationBarItem(
                    selected = selected == item,
                    onClick = { selected = item },
                    icon = { Icon(if (item == "Flow builder") Icons.Default.AccountTree else Icons.Default.SmartToy, contentDescription = null) },
                    label = { Text(item, fontSize = 10.sp) }
                )
            }
        }
    }) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding).padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(15.dp)
        ) {
            item {
                Row(Modifier.fillMaxWidth().padding(top = 20.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("NagiStudio", color = Purple, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Text(if (selected == "Overview") "Your bot workspace" else selected, color = Ink, fontSize = 25.sp, fontWeight = FontWeight.ExtraBold)
                    }
                    FilledTonalIconButton(onClick = { showCreate = true }) { Icon(Icons.Default.Add, contentDescription = "Create bot") }
                }
            }
            if (selected == "Overview" || selected == "My bots") {
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        MetricCard("Total bots", bots.size.toString(), Modifier.weight(1f))
                        MetricCard("Active flows", "12", Modifier.weight(1f))
                    }
                }
                item {
                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                        Text("Your bots", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Ink, modifier = Modifier.weight(1f))
                        TextButton(onClick = { showCreate = true }) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Text("Create")
                        }
                    }
                }
                items(bots.size) { index ->
                    Card(shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
                        Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                            Box(Modifier.size(42.dp).background(Color(0xFFEFEDFF), RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) {
                                Icon(Icons.Default.SmartToy, contentDescription = null, tint = Purple)
                            }
                            Column(Modifier.weight(1f).padding(start = 12.dp)) {
                                Text(bots[index], fontWeight = FontWeight.Bold, color = Ink)
                                Text(if (index == 2) "Web · Draft" else "Discord · Running", color = Color.Gray, fontSize = 12.sp)
                            }
                            Text(if (index == 2) "Draft" else "Running", color = if (index == 2) Color(0xFFB17A2F) else Color(0xFF249B77), fontSize = 11.sp)
                        }
                    }
                }
            } else {
                item {
                    Card(colors = CardDefaults.cardColors(containerColor = Color.White), shape = RoundedCornerShape(16.dp)) {
                        Column(Modifier.fillMaxWidth().padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Icon(if (selected == "Flow builder") Icons.Default.AccountTree else Icons.Default.Bolt, contentDescription = null, tint = Purple, modifier = Modifier.size(30.dp))
                            Text(if (selected == "Flow builder") "Visual flow builder" else "Settings", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Ink)
                            Text(
                                if (selected == "Flow builder") "Create triggers, messages, and conditions. The interactive workflow editor is coming next."
                                else "Account, platform connections, and secure bot credentials will be configured here.",
                                color = Color.Gray, fontSize = 13.sp
                            )
                            if (selected == "Flow builder") Button(onClick = {}) { Text("Add first block") }
                        }
                    }
                }
            }
            item { Text("NagiStudio • Starter preview", color = Color.Gray, fontSize = 11.sp, modifier = Modifier.padding(vertical = 14.dp)) }
        }
    }
    if (showCreate) AlertDialog(
        onDismissRequest = { showCreate = false },
        title = { Text("Create a bot") },
        text = { OutlinedTextField(value = botName, onValueChange = { botName = it }, label = { Text("Bot name") }, singleLine = true) },
        confirmButton = {
            TextButton(onClick = {
                if (botName.isNotBlank()) {
                    bots = listOf(botName.trim()) + bots
                    botName = ""
                    showCreate = false
                    selected = "My bots"
                }
            }) { Text("Create") }
        },
        dismissButton = { TextButton(onClick = { showCreate = false }) { Text("Cancel") } }
    )
}

@Composable
private fun MetricCard(label: String, value: String, modifier: Modifier = Modifier) {
    Card(modifier, colors = CardDefaults.cardColors(containerColor = Color.White), shape = RoundedCornerShape(14.dp)) {
        Column(Modifier.padding(16.dp)) {
            Text(label, color = Color.Gray, fontSize = 12.sp)
            Text(value, color = Ink, fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Bolt, contentDescription = null, tint = Purple, modifier = Modifier.size(13.dp))
                Text(" Workspace overview", color = Color.Gray, fontSize = 10.sp)
            }
        }
    }
}
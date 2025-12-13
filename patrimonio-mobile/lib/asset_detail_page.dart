import 'package:flutter/material.dart';

class AssetDetailPage extends StatelessWidget {
  final Map<String, dynamic> asset;
  const AssetDetailPage({super.key, required this.asset});
  @override
  Widget build(BuildContext ctx) {
    return Scaffold(
      appBar: AppBar(title: Text(asset['name'] ?? '')),
      body: Column(children: [
        Text('Código: ${asset['code'] ?? ''}'),
        Text('Valor Total: ${asset['total_value'] ?? ''}'),
        ElevatedButton(onPressed: () {}, child: const Text('Movimentar'))
      ]),
    );
  }
}


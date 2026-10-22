<?php
$host = '127.0.0.1';
$db   = 'barcelona_budget';
$user = 'root'; 
$pass = ''; 
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}

$stmt = $pdo->query('SELECT category_name, item_label, amount FROM budget_categories');
$budget_items = $stmt->fetchAll();
$total = 0;
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Mon Budget Barcelone</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background-color: #f4f4f9; color: #333; }
        table { border-collapse: collapse; width: 100%; max-width: 600px; background: #fff; margin-bottom: 20px;}
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #fbc02d; color: #333; }
        .total { font-weight: bold; font-size: 1.2em; background-color: #f9f9f9; }
    </style>
</head>
<body>
    <h2>Mon Budget - 5 Nuits à Barcelone</h2>
    <table>
        <tr>
            <th>Catégorie</th>
            <th>Dépense</th>
            <th>Montant (€)</th>
        </tr>
        <?php foreach ($budget_items as $item): ?>
            <tr>
                <td><?= htmlspecialchars($item['category_name']) ?></td>
                <td><?= htmlspecialchars($item['item_label']) ?></td>
                <td><?= number_format($item['amount'], 2, ',', ' ') ?> €</td>
            </tr>
            <?php $total += $item['amount']; ?>
        <?php endforeach; ?>
        <tr class="total">
            <td colspan="2" style="text-align: right;">Total prévu :</td>
            <td><?= number_format($total, 2, ',', ' ') ?> €</td>
        </tr>
    </table>
    <p><strong>Budget max par personne :</strong> 650,00 €</p>
</body>
</html>

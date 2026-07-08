<?php
$nilai = [95, 80, 70, 55, 40, 20];
foreach ($nilai as $n) {
if ($n >= 85) {
    echo "Nilai $n = Sangat Baik <br>";
} elseif ($n >= 70)   {
    if ($n >= 75) {
        echo "Nilai $n = Baik (Lulus) <br>";
} else {
    echo "Nilai $n = Cukup (Perlu perbaikan) <br>";
}
} else {
if ($n >= 50) {
    echo "Nilai $n = Kurang (Tidak Lulus) <br>";
} else {
    echo "Nilai $n = Sangat Kurang (Remedial) <br>";
}
}
}
?>

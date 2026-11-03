#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    double sum = 0, p;
    for (int i = 0; i < n; i++) cin >> p, sum += p;
    cout << fixed << setprecision(12) << sum / n << endl;
    return 0;
}

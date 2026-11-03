#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a[n];
    for (int i = 0; i < n; i++) {
        cin >> a[i];
        while (a[i] % 2 == 0) a[i] /= 2;
        while (a[i] % 3 == 0) a[i] /= 3;
    }
    bool ok = true;
    for (int i = 1; i < n; i++)
        if (a[i] != a[0]) ok = false;
    if (ok) cout << "YES\n";
    else cout << "NO\n";
    return 0;
}

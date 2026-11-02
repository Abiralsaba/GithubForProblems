#include <bits/stdc++.h>
using namespace std;

int main() {
    long long x, y, n;
    cin >> x >> y >> n;
    long long a[6];
    a[1] = x;
    a[2] = y;
    a[3] = y - x;
    a[4] = -x;
    a[5] = -y;
    a[0] = x - y;
    long long ans = a[n % 6];
    long long mod = 1000000007;
    ans = (ans % mod + mod) % mod;
    cout << ans << endl;
    return 0;
}
